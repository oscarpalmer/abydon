import { Fragment } from './fragment';
import type { FragmentData } from './models';
export declare function html(strings: TemplateStringsArray, ...values: unknown[]): Fragment;
export declare function parse(data: FragmentData): string;
