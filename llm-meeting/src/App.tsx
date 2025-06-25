import Box from "@mui/material/Box"
import { useState } from "react"
import Phase0 from "./pages/Phase0";
import Phase1 from "./pages/Phase1";
import Phase2 from "./pages/Phase2";
import Phase3 from "./pages/Phase3";
import { Link } from "@mui/material";

function App() {
  const [phase, setPhase] = useState<number>(0);
  const [agenda, setAgenda] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [limitTime, setLimitTime] = useState<number>(1800);
  const [meetingContentAll, setMeetingContentAll] = useState<string>("");
  const onClickNew = () => {
    setPhase(0);
  }
  return (
    <Box sx={{
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(36, 99, 235, 0.05)",
      padding: "0px",
      display: "flex",
    }}>
      { phase !== 2 &&
        <Box sx={{
          width: "10vw",
          flexBasis: "10vw",
          paddingLeft: "10px"
        }}
        >
          <br/>
          <Link
            onClick={onClickNew}
          >
            新規作成
          </Link>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <Link
          >
            過去の議事録
          </Link>
        </Box>
      }
      <Box sx={{
        width: phase !== 2 ? "90vw" : "100vw",
        flexBasis: phase !== 2 ? "90vw" : "100vw",
        margin: "0px",
        padding: "0px 20px 20px",
        height: "auto",
        backgroundColor: "white",
        borderRadius: "20px"
      }}>
        {
        phase === 0
        ?
        <Phase0
          setPhase={setPhase}
          agenda={agenda}
          goal={goal}
          limitTime={limitTime}
          setAgenda={setAgenda}
          setGoal={setGoal}
          setLimitTime={setLimitTime}
        />
        : phase === 1
        ?
        <Phase1
          setPhase={setPhase}
        />
        : phase === 2
        ?
        <Phase2
          setPhase={setPhase}
          agenda={agenda}
          goal={goal}
          limitTime={limitTime}
          setMeetingContentAll={setMeetingContentAll}
        />
        : phase === 3
        ?
        <Phase3
          setPhase={setPhase}
          agenda={agenda}
          goal={goal}
          limitTime={limitTime}
          meetingContentAll={meetingContentAll}
        />
        : <p>unknown phase...</p>
        }
      </Box>
    </Box>
  )
}

export default App
