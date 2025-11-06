import { ComponentType } from 'react';

export type FunctionComponent = React.ReactElement | null;

export type ExtractProps<T> = T extends ComponentType<infer P> ? P : T;
