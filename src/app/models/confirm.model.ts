export interface IConfirm {
    btnClose: () => void;
    btnConfirm?: () => void;
    header: string;
    message: string;
    htmlTemplate?: string;
    buttonLabels: {
        btnClose: string;
        btnConfirm?: string;
    }
}