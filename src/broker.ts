import * as eio from "engine.io-client";
import { v4 as uuidv4 } from "uuid";
import { assert } from "./assert";

type message =
  | { type: "session"; session_id: string }
  | { type: "syn"; i: number };

export class Broker {
  private url: string;
  private session_id: string = uuidv4();
  private connection: eio.Socket | undefined;
  private reconnect = true;
  private message_queue: message[] = [];
  private syn = 0;
  private sent_queue: message[] = [];

  constructor(url: string) {
    this.url = url;
    this.keep_connection();
  }

  public terminate() {
    this.reconnect = false;
    this.connection?.close();
    this.connection = undefined;
  }

  private send(message: message) {
    if (this.message_queue.length === 0) {
      setTimeout(() => this.flush_message_queue(), 0);
    }
    this.message_queue.push(message);
  }

  private flush_message_queue() {
    if (!this.connection) return;
    const ls: message[] = [
      ...this.sent_queue,
      ...this.message_queue,
      { type: "syn", i: this.syn },
    ];
    this.syn += 1;
    this.connection.send(JSON.stringify(ls));
    this.sent_queue = ls;
    this.message_queue = [];
  }

  private keep_connection() {
    if (!this.reconnect) return;
    const connection = new eio.Socket(this.url);

    connection.on("close", (reason, desc) => {
      console.log(reason);
      console.log(desc);
      this.connection = undefined;
      setTimeout(() => this.keep_connection(), 100);
    });

    connection.on("message", (data) => {
      assert(typeof data === "string");
      const messages = JSON.parse(data);
      assert(Array.isArray(messages));
      messages.forEach((message) => {
        console.log(message);
        assert(typeof message === "object");
        switch (message.type) {
          case "ack": {
            const { i } = message;
            const idx = this.sent_queue.findIndex(
              (x) => x.type === "syn" && x.i === i
            );
            assert(idx >= 0);
            this.sent_queue.splice(0, idx + 1);
            return;
          }
          default:
            throw new Error(`unexpected message type ${message.type}`);
        }
      });
    });

    connection.on("open", () => {
      console.log("connection is open");
      if (this.reconnect) {
        assert(this.connection === undefined);
        this.connection = connection;
        this.send({ type: "session", session_id: this.session_id });
      } else {
        connection.close();
      }
    });
  }
}
