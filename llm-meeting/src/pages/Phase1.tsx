import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Markdown from "react-markdown";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
};

const Phase1: React.FC<Props> = ({ setPhase }) => {
  const [iceBreak, setIceBreak] = useState<string>("");
  const [latestTopic, setLatestTopic] = useState<string>("");
  const [dialogContent, setDialogContent] = useState("");
  async function getIceBreak() {
    let result1 = "";
    let result2 = "";
    try {
      setIceBreak("");
      const today = new Date();
      Promise.all([
        fetch("https://mac-sdo.com/get-anniversary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            month: today.getMonth() + 1,
            date: today.getDate(),
          }),
        }),
        fetch(
          "https://mac-sdo-get-latest-topics-387251040101.europe-west1.run.app"
        ),
      ]).then(async ([res1, res2]) => {
        result1 = await res1.text();
        result2 = await res2.text();
        setLatestTopic(result2);
        const resultJson = JSON.parse(result1);
        if (resultJson.content) setIceBreak(resultJson.content);
        else setIceBreak(result1);
      });
    } catch (e) {
      console.error(e);
      setIceBreak(result1);
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
      {latestTopic && iceBreak ? (
        <>
          <Box
            sx={{
              border: "1px solid black",
              borderRadius: "20px",
              width: "70vw",
              padding: "10px 20px",
              marginBottom: "20px",
            }}
            onClick={() => setDialogContent(iceBreak)}
          >
            記念日のアイスブレーク
          </Box>
          <Box
            sx={{
              border: "1px solid black",
              borderRadius: "20px",
              width: "70vw",
              padding: "10px 20px",
              marginBottom: "20px",
            }}
            onClick={() => setDialogContent(latestTopic)}
          >
            最新のトピックのアイスブレーク
          </Box>
        </>
      ) : <CircularProgress/>
      }
      <Button onClick={getIceBreak} color="success" variant="contained">
        再度話題を考えてもらう
      </Button>
      <hr style={{ margin: "20px auto" }} />
      <Button onClick={onSubmit} color="primary" variant="contained">
        議論を始める
      </Button>
      <Dialog open={!!setDialogContent}>
        <DialogContent>
          <Markdown>{dialogContent}</Markdown>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogContent("")}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Phase1;
