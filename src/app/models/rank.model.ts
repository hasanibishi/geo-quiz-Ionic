import { IQuestion } from "./question.model";

export interface IRank {
    rank: number;
    value: number;
    questions: IQuestion[]
}