import { IOption } from "./option.model";

export interface IQuestion {
    id: string;
    text: string;
    option_a: IOption,
    option_b: IOption,
    option_c: IOption,
    option_d: IOption
}