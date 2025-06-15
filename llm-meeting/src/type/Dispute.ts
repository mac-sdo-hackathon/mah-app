export type DisputeStep = {
    step: number;
    title: string;
    action: string;
}

export type Dispute = {
    conflict_detected: boolean;
    conflict_content: string;
}