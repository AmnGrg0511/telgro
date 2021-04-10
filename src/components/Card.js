import { Button } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { Link } from "react-router-dom";

export const Card = ({ module, topics, topic, handleClick, disabled, isTopic }) => {
  return (
    <li className="articles__article">
      <Link className="articles__link" to={`/module/${module}${isTopic ? `/${topic}` : ""}`}>
        <div className="articles__content articles__content--lhs">
          <h2 className="articles__title">{isTopic ? topic : module}</h2>
          <div className="articles__footer">
            {handleClick ? (
              <Button
                onClick={handleClick}
                disabled={disabled}
                color="Primary"
                variant="outlined"
                style={{ marginTop: "1.5rem" }}
                endIcon={<Send />}
              >
                Request
              </Button>
            ) : (
              <p />
            )}
            <p>
              {topics?.length} Topic{topics?.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="articles__content articles__content--rhs">
          <h2 className="articles__title">{isTopic ? topic : module}</h2>
          <div className="articles__footer">
            {handleClick ? (
              <Button
                onClick={handleClick}
                disabled={disabled}
                color="Primary"
                variant="outlined"
                style={{ marginTop: "1.5rem" }}
                endIcon={<Send />}
              >
                Request
              </Button>
            ) : (
              <p />
            )}
            <p>
              {topics?.length} Topic{topics?.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
};
