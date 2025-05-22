import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from "@mui/material";
import { fetch } from "./fetch";
import { JSONBox } from "./json-box";
import { Spinner } from "./spinner";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { broker_state } from "./broker";
import { useState } from "react";
import { uuidv4 } from "./uuidv4";
import { command_type } from "schemata/generated/command_type";
import { Link } from "react-router-dom";

type UserBoardsProps = {
  user_id: string;
  fetch: fetch;
  commands: broker_state["commands"];
  submit_command: (
    command_uuid: string,
    command: command_type,
    on_done: () => void
  ) => void;
};

type form_state =
  | { type: "idle" }
  | { type: "editing" }
  | { type: "submitting"; command_uuid: string };

const form_editable: (
  state: form_state,
  commands: broker_state["commands"]
) => boolean = (state, commands) => {
  switch (state.type) {
    case "idle":
      return false;
    case "editing":
      return true;
    case "submitting": {
      const command_state = commands[state.command_uuid];
      switch (command_state) {
        case undefined:
        case "queued":
          return false;
        case "succeeded":
        case "failed":
        case "aborted":
          return true;
        default:
          const invalid: never = command_state;
          throw invalid;
      }
    }
    default:
      const invalid: never = state;
      throw invalid;
  }
};

type FormComponent<T> = React.FunctionComponent<{
  data: T;
  set_data: (data: T) => void;
  editable: boolean;
  submit: (() => void) | undefined;
  cancel: () => void;
}>;

type CommandFormProps<T> = {
  initial_data: T;
  data_ok: (data: T) => boolean;
  make_command: (data: T) => command_type;
  component: FormComponent<T>;
  initially_editable: boolean;
  commands: broker_state["commands"];
  submit_command: (
    command_uuid: string,
    command: command_type,
    on_done: () => void
  ) => void;
};

function CommandForm<T>({
  initial_data,
  data_ok,
  make_command,
  commands,
  component: Component,
  initially_editable,
  submit_command,
}: CommandFormProps<T>) {
  const [state, set_state] = useState<form_state>(
    initially_editable ? { type: "editing" } : { type: "idle" }
  );
  const [data, set_data] = useState(initial_data);
  const editable = form_editable(state, commands);
  const submit = data_ok(data)
    ? () => {
        const command = make_command(data);
        const command_uuid = uuidv4();
        set_state({ type: "submitting", command_uuid });
        submit_command(command_uuid, command, () => set_data(initial_data));
        console.log("Submitting");
      }
    : undefined;
  function cancel() {
    set_state({ type: "idle" });
    set_data(initial_data);
  }
  return (
    <Component
      editable={editable}
      data={data}
      set_data={set_data}
      submit={submit}
      cancel={cancel}
    />
  );
}

const NewBoardComponent: FormComponent<{ board_name: string }> = ({
  editable,
  data,
  set_data,
  submit,
}) => {
  return (
    <Paper style={{ width: "30%", margin: "5px", padding: "0px 5px" }}>
      Create a new board
      <div style={{ display: "flex", flexDirection: "row" }}>
        <TextField
          variant="standard"
          fullWidth
          placeholder="board name"
          disabled={!editable}
          value={data.board_name}
          onChange={(e) => set_data({ board_name: e.target.value })}
        />
        <IconButton
          aria-label="edit"
          onClick={submit}
          size="small"
          color="primary"
          disabled={!editable || !submit || data.board_name.length === 0}
        >
          <AddCircleIcon fontSize="inherit" />
        </IconButton>
      </div>
    </Paper>
  );
};

export function UserBoards({
  user_id,
  fetch,
  commands,
  submit_command,
}: UserBoardsProps) {
  const boards = fetch("user_boards", user_id);
  if (boards === undefined)
    return (
      <div>
        <Spinner />
      </div>
    );
  return (
    <div>
      Boards
      <List style={{ width: "30%" }}>
        {(boards?.list ?? []).map((board_id) => (
          <ListItem
            key={board_id}
            disablePadding
            component={Link}
            to={`/board/${board_id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ListItemButton>
              <ListItemText primary={fetch("board", board_id)?.name ?? "..."} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <CommandForm
        data_ok={({ board_name }) => board_name.length > 0}
        make_command={({ board_name }) => ({
          type: "create_board",
          data: { board_id: uuidv4(), board_name },
        })}
        commands={commands}
        component={NewBoardComponent}
        initially_editable={true}
        initial_data={{ board_name: "" }}
        submit_command={submit_command}
      />
      {false && (
        <JSONBox
          json={{
            user_id,
            ping: fetch("counter", "ping"),
            boards,
          }}
        />
      )}
    </div>
  );
}
