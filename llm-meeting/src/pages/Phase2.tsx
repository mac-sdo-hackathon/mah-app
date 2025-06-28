import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import ReactMarkdown from "react-markdown";
import { copy } from "clipboard";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";

import { blobToBase64 } from "../utils/blob";
import Mermaid from "../components/Mermaid";
import type { Dispute } from "../type/Dispute";
import type { Tangent } from "../type/Tangent";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
  agenda: string;
  goal: string;
  limitTime: number;
  setMeetingContentAll: Dispatch<SetStateAction<string>>;
};

const Phase2: React.FC<Props> = ({
  setPhase,
  limitTime,
  agenda,
  goal,
  setMeetingContentAll,
}) => {
  const meetingStartTime = useRef<Date>(new Date());
  const meetingEndTime = useRef<Date>(new Date());
  const [meetingTime, setMeetingTime] = useState<number>(0);
  const meetingTimeRef = useRef<number>(0);
  const startTime = useRef<Date>(new Date());
  const endTime = useRef<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioChunks = useRef<any[]>([]);

  const [meetingContent, setMeetingContent] = useState<string[]>([]);
  const meetingContentRef = useRef<string[]>([]);
  const [itemContent, setItemContent] = useState<string[]>([]);
  const isItemDetected = itemContent.length > 0;
  const [displayItemContent, setDisplayItemContent] = useState<string[]>([]);
  // 内容が脇道に逸れているか表示されます
  const [tangent, setTangent] = useState<Tangent>({} as Tangent);
  const isTangentDetected = (tangent.confidence ?? 100) < 40;
  const [tangentContent, setTangentContent] = useState<string>("");
  // 争いが起きていたら仲裁します
  const [dispute, setDispute] = useState<Dispute>({} as Dispute);
  const isDisputeDetected = dispute.conflict_detected ?? false;
  const [disputeContent, setDisputeContent] = useState<string>("");
  // マーメイド図
  const [mermaidM, setMermaidM] = useState("");

  const onEndMeeting = () => {
    setPhase(3);
  };

  async function recordMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // const audioContext = new AudioContext();
    // const analyser = audioContext.createAnalyser();
    // const source = audioContext.createMediaStreamSource(stream);
    // source.connect(analyser);
    const mediaRecorder = new MediaRecorder(stream);

    // analyser.fftSize = 32; // 周波数データの分解能を設定

    mediaRecorder.ondataavailable = (event) => {
      console.log(event.data);
      audioChunks.current = [...audioChunks.current, event.data];
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const audioBase64 = await blobToBase64(audioBlob);
      let result = "";
      try {
        const response = await fetch(
          "https://mac-sdo.com/recording-meeting",
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ audioBase64 }),
          }
        );
        result = await response.text();
        const resultJson = JSON.parse(result);
        if (resultJson.content) result = resultJson.content
        audioChunks.current = [];
        setMeetingContent((prev) => [...prev, result].slice(-10));
        setMeetingContentAll((prev) => prev + result);
        meetingContentRef.current = [
          ...meetingContentRef.current,
          result,
        ].slice(-10);
      } catch (e) {
        console.error(e);
        audioChunks.current = [];
        setMeetingContent((prev) => [...prev, result].slice(-10));
        setMeetingContentAll((prev) => prev + result);
        meetingContentRef.current = [
          ...meetingContentRef.current,
          result,
        ].slice(-10);
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 15000); // 15秒録音
  }

  async function fetchActionItem() {
    try {
      const response = await fetch(
        "https://mac-sdo.com/action-item-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      const resultContent = JSON.parse(result);
      if (!resultContent.content) {
        setItemContent([]);
        return;
      }
      const resultArray = JSON.parse(
        resultContent.content.replace("```json", "").replace("```", "")
      );
      if (!Array.isArray(resultArray)) {
        setItemContent([]);
        return;
      }
      setItemContent(resultArray);
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchTangent() {
    try {
      const response = await fetch(
        "https://mac-sdo.com/tangent-topic-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      const tangentContentJSON = JSON.parse(result);
      if (tangentContentJSON.content) {
        const tangentJSON = JSON.parse(
          tangentContentJSON.content.replace("```json", "").replace("```", "")
        );
        setTangent(tangentJSON as Tangent);
      }
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchDispute() {
    try {
      const response = await fetch(
        "https://mac-sdo.com/dispute-argument-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      const disputeContentJSON = JSON.parse(result);
      if (disputeContentJSON.content) {
        const disputeJSON = JSON.parse(
          disputeContentJSON.content.replace("```json", "").replace("```", "")
        );
        setDispute(disputeJSON as Dispute);
      }
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchMermaid() {
    let result = "";
    try {
      const response = await fetch(
        "https://mac-sdo.com/visualize-mermaid-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      result = await response.text();
      const resultJson = JSON.parse(result);
      if (resultJson.content) setMermaidM(resultJson.content.replace("```mermaid", "").replace("```", ""));
    } catch (e) {
      console.error(e);
      setMermaidM(result.replace("```mermaid", "").replace("```", ""))
    }
  }

  const copyToClipboard = async () => {
    copy(mermaidM);
  };

  useEffect(() => {
    startTime.current = new Date();
    const endTimeTmp = new Date();
    endTimeTmp.setSeconds(startTime.current.getSeconds() + 30);
    endTime.current = endTimeTmp;
    recordMedia();
  }, []);

  useEffect(() => {
    const meetingEndTimeTmp = new Date();
    meetingEndTimeTmp.setSeconds(
      meetingStartTime.current.getSeconds() + limitTime
    );
    meetingEndTime.current = meetingEndTimeTmp;
    const id = setInterval(() => {
      const diffTime = meetingEndTime.current.getTime() - Date.now();
      setMeetingTime(Math.floor(diffTime / 1000));
      meetingTimeRef.current = Math.floor(diffTime / 1000);
      // 次の録音へ（会議が終わっていないなら）
      if (
        meetingTimeRef.current % 15 === 0 &&
        meetingContentRef.current.length
      ) {
        requestAnimationFrame(() => {
          recordMedia();
        }); // 次の録音を即開始
      }
      if (
        meetingTimeRef.current % 30 === 0 &&
        meetingContentRef.current.length
      ) {
        fetchActionItem();
        fetchDispute();
        fetchTangent();
        fetchMermaid();
      }
      if (meetingTimeRef.current < 0) {
        setPhase(3);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Mermaid
        code={mermaidM}
        style={{ position: "relative", width: "80vw", height: "80vh" }}
      ></Mermaid>
      <Box
        sx={{
          position: "fixed",
          top: "20px",
          left: "20px",
        }}
      >
        残り{meetingTime}秒
      </Box>
      <Box
        sx={{
          width: "400px",
          display: "flex",
          gap: "30px",
          position: "fixed",
          top: "20px",
          right: "20px",
        }}
      >
        <Box
          sx={{
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            backgroundColor: "#eee",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${isTangentDetected ? "red" : "#00000040"}`,
          }}
          onClick={() => setTangentContent(tangent.content)}
        >
          脱線
        </Box>
        <Box
          sx={{
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            backgroundColor: "#eee",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${isDisputeDetected ? "red" : "#00000040"}`,
          }}
          onClick={() => setDisputeContent(dispute.conflict_content)}
        >
          対立
        </Box>
        <Box
          sx={{
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            backgroundColor: "#eee",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${isItemDetected ? "blue" : "#00000040"}`,
          }}
          onClick={() => setDisplayItemContent(itemContent)}
        >
          A/I
        </Box>
      </Box>
      {!!displayItemContent.length && (
        <Box
          sx={{
            borderRadius: "10px",
            backgroundColor: "#F0F5FF",
            position: "fixed",
            top: "150px",
            right: "60px",
            width: "300px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <p style={{ margin: "5px 10px" }}>Action Item</p>
            <Box
              sx={{
                marginRight: "10px",
              }}
              onClick={() => setDisplayItemContent([])}
            >
              ×
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: "white",
              width: "260px",
              margin: "0px 10px 10px",
              padding: "10px",
              height: "150px",
              overflow: "scroll",
            }}
          >
            {displayItemContent.map((it) => {
              return (
                <>
                  ・{it}
                  <br />
                </>
              );
            })}
          </Box>
        </Box>
      )}
      <Button
        color="primary"
        variant="contained"
        onClick={copyToClipboard}
        sx={{ position: "fixed", bottom: "50px", left: "50px" }}
      >
        マーメイド図をコピーする
      </Button>
      {!!meetingContent.length && (
        <Box
          sx={{
            color: "white",
            backgroundColor: "#66666670",
            padding: "5px 10px",
            display: "flex",
            justifyContent: "center",
            position: "fixed",
            bottom: "20px",
            margin: "10px 0vw 10px 20px",
            width: "80vw",
          }}
        >
          {meetingContent[meetingContent.length - 1]}
        </Box>
      )}
      <Box
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "60px",
        }}
      >
        <Tooltip title="会議を終了する">
          <Box
            sx={{
              borderRadius: "50%",
              backgroundColor: "red",
              width: "100px",
              height: "100px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "50px",
              color: "white",
            }}
            onClick={onEndMeeting}
          >
            □
          </Box>
        </Tooltip>
      </Box>
      <Dialog
        open={!!tangentContent}
        sx={{
          padding: "30px",
        }}
      >
        <DialogTitle>脱線回避方法</DialogTitle>
        <DialogContent
          sx={{
            width: "70vw",
          }}
        >
          <ReactMarkdown>{tangentContent}</ReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTangentContent("")}
            variant="outlined"
            color="primary"
          >
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!disputeContent}
        sx={{
          padding: "30px",
        }}
      >
        <DialogTitle>対立回避方法</DialogTitle>
        <DialogContent
          sx={{
            width: "70vw",
          }}
        >
          <ReactMarkdown>{disputeContent}</ReactMarkdown>
        </DialogContent>
        <Button
          onClick={() => setDisputeContent("")}
          variant="outlined"
          color="primary"
        >
          キャンセル
        </Button>
      </Dialog>
    </>
  );
};

export default Phase2;
