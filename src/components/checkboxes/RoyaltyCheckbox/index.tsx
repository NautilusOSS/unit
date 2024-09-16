import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { FormControlLabel } from "@mui/material";

const label = { inputProps: { "aria-label": "Royalties Checkbox" } };

interface RoyaltyCheckboxProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  defaultChecked?: boolean;
}
const IconCheckboxes: React.FC<RoyaltyCheckboxProps> = ({
  onChange = () => {},
  defaultChecked = false,
}) => {
  return (
    <div>
      <FormControlLabel
        label="Royalties"
        control={
          <Checkbox
            {...label}
            defaultChecked={defaultChecked}
            onChange={onChange}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
          />
        }
      />
    </div>
  );
};
export default IconCheckboxes;
