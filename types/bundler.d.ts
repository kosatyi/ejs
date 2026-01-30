import type { Plugin } from 'rollup'
import { EjsConfig } from './ejs'

export interface BundlerOptions {
    target: string[] | string
    minify?: boolean
    umd?: boolean
}

export function ejsBundle(
    options: BundlerOptions | object,
    config: EjsConfig | object,
): Plugin

export function bundler(
    options: BundlerOptions,
    config: EjsConfig,
): {
    build(): Promise<void>
    watch(): Promise<void>
    concat(): Promise<void>
    output(): Promise<void>
}
