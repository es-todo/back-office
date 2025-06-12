import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import { JSONBox } from "./json-box";
import { Spinner } from "./spinner";
import { uuidv4 } from "./uuidv4";
import { Link } from "react-router-dom";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { TextField } from "./text-field";
import { SubmitButton } from "./submit-button";

type UserBoardsProps = {
  user_id: string;
  C: Context;
};

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
          placeholder="board name"
          editable={editable}
          value={data.board_name}
          set_value={(e) => set_data({ board_name: e })}
        />
        <SubmitButton
          submit={
            !editable || !submit || data.board_name.length === 0
              ? undefined
              : submit
          }
        />
      </div>
    </Paper>
  );
};

export function UserBoards({ user_id, C }: UserBoardsProps) {
  const boards = C.fetch("user_boards", user_id);
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
              <ListItemText
                primary={C.fetch("board", board_id)?.name ?? "..."}
              />
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
        component={NewBoardComponent}
        initially_editable={true}
        initial_data={{ board_name: "" }}
        C={C}
      />
      {false && (
        <JSONBox
          json={{
            user_id,
            ping: C.fetch("counter", "ping"),
            boards,
          }}
        />
      )}
    </div>
  );
}
