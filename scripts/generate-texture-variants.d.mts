/**
 * Hand-written declarations for the generator, so the unit test that keeps
 * `VARIANT_SIZES` in step with the quality ladder can import the real value
 * instead of maintaining a third copy of the list.
 */
export declare const VARIANT_SIZES: readonly number[];
export declare const variantPath: (source: string, size: number) => string;
