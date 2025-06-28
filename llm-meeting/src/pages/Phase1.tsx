import { Box, Button, CircularProgress } from "@mui/material";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
};

const Phase1: React.FC<Props> = ({ setPhase }) => {
  const [iceBreak, setIceBreak] = useState<string>("");
  async function getIceBreak() {
    let result = "";
    try {
      setIceBreak("");
      const today = new Date();
      const response = await fetch("https://mac-sdo.com/get-anniversary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: today.getMonth() + 1,
          date: today.getDate(),
        }),
      });
      result = await response.text();
      const resultJson = JSON.parse(result);
      if (resultJson.content) setIceBreak(resultJson.content);
    } catch (e) {
      console.error(e);
      setIceBreak(result);
    }
  }
  useEffect(() => {
    getIceBreak();
  }, []);
  const onSubmit = () => {
    setPhase(2);
  };
  return (
    <Box>
      <h3>アイスブレーク</h3>
      <h5>{iceBreak ? iceBreak : <CircularProgress />}</h5>
      <Button onClick={getIceBreak} color="success" variant="contained">
        再度話題を考えてもらう
      </Button>
      <hr style={{ margin: "20px auto" }} />
      <Button onClick={onSubmit} color="primary" variant="contained">
        議論を始める
      </Button>
    </Box>
  );
};

export default Phase1;
