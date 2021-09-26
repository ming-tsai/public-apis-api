import { API } from "./api.interface";

export interface Category {
    name: string;
    href: string;
    apis: API[];
}
