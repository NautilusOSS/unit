import styled from "styled-components";

export const LgIconLink = styled.a`
  /* display: none; */
  cursor: pointer;
  &:hover {
    color: #9933ff;
  }
  @media screen and (min-width: 600px) {
    display: inline-flex;
  }
`;