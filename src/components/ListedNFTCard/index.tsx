import * as React from "react";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import NftCard, { NFTCardProps } from "../NFTCard";

const ListedNftCard: React.FC<NFTCardProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <div>
      <button
        aria-describedby={id}
        type="button"
        onClick={handleClick}
      ></button>
      <NftCard {...props} onClick={handleClick} />
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box sx={{ border: 1, p: 1,
           bgcolor: "background.paper" }}>
          The content of the Popper.
        </Box>
      </Popper>
    </div>
  );
};

export default ListedNftCard;
