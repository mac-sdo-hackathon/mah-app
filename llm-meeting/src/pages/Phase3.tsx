import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
  agenda: string;
  goal: string;
  limitTime: number;
  meetingContentAll: string;
};

const Phase3: React.FC<Props> = ({
  agenda,
  goal,
  limitTime,
  meetingContentAll,
}) => {
  const [summarizeResult, setSummarizeResult] = useState<string>("");

  async function fetchSummarize() {
    let result = "";
    try {
      const response = await fetch(
        "https://mac-sdo.com/summarize-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentAll,
          }),
        }
      );
      result = await (await response).text();
      const resultJson = JSON.parse(result);
      if (resultJson.content) setSummarizeResult(resultJson.content);
    } catch (e) {
      console.error(e);
      setSummarizeResult(result);
    }
  }

  useEffect(() => {
    fetchSummarize();
  }, []);

  return (
    <Box sx={{ overflow: "scroll", height: "calc(100vh - 50px)" }}>
      <p>上限時間{limitTime}秒の会議</p>
      <hr />
      {summarizeResult ? (
        <ReactMarkdown>{summarizeResult}</ReactMarkdown>
      ) : (
        <>
          <CircularProgress />
          <p>議事録生成中...</p>
        </>
      )}
    </Box>
  );
};

export default Phase3;
