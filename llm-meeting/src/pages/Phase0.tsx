import { Box, Button, TextareaAutosize, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { styled } from '@mui/system';

const CustomTextarea = styled(TextareaAutosize)(
  ({ theme }) => ({
    width: '100%',
    fontSize: '16px',
    fontFamily: 'inherit',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.mode === 'dark' ? '#4b5563' : '#ccc'}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },
    '&::placeholder': {
      color: theme.palette.text.secondary,
    },
  })
);

type Props = {
    setPhase: Dispatch<SetStateAction<number>>;
    agenda: string;
    setAgenda: Dispatch<SetStateAction<string>>;
    goal: string;
    setGoal: Dispatch<SetStateAction<string>>;
    limitTime: number;
    setLimitTime: Dispatch<SetStateAction<number>>;
}

const Phase0: React.FC<Props> = ({
    setPhase,
    agenda,
    goal,
    limitTime,
    setAgenda,
    setGoal,
    setLimitTime
}) => {

    const onSubmit = () => {
        if (!agenda || !goal || !limitTime) return
        setPhase(1);
    }

    return (
        <Box>
            <h3>FaciliChat</h3>
            <p>会議のゴール</p>
            <TextField
                value={goal}
                onChange={(e) => {
                    setGoal(e.target.value);
                }}
                sx={{
                    width: "50vw",
                }}
            />
            <br/>
            <p>アジェンダ</p>
            <CustomTextarea
                style={{
                    width: "60vw",
                    height: "150px",
                }}
                value={agenda}
                onChange={(e) => {
                    setAgenda(e.target.value);
                }}
            />
            <br/>
            <p>会議の時間を入力してください</p>
            <TextField
                type="number"
                value={limitTime}
                onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (isNaN(value)) return;
                    setLimitTime(value);
                }}
                sx={{
                    width: "50vw",
                }}
            />
            <br/>
            <br/>
            <Button
                color="primary"
                variant="contained"
                onClick={onSubmit}
                sx={{
                    padding: "10px 15px"
                }}
            >
                会議に進む（自動的にレコードが開始します）
            </Button>
        </Box>
    )
}

export default Phase0;