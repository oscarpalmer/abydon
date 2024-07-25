import type { Fragment, FragmentData } from './models';
export declare function html(strings: TemplateStringsArray, ...values: unknown[]): Fragment;
export declare function parse(data: FragmentData): string;
