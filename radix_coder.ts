/**
 * https://github.com/hunterwb/base-x
 *
 * MIT License
 *
 * Copyright (c) 2018-2019, Hunter WB <hunterwb.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

namespace BaseX {
    export abstract class RadixCoder {
        public static readonly BASE_MIN: number = 2
        public static readonly BASE_MAX_U8: number = 0x100
        public static readonly BASE_MAX_U16: number = 0x10000
        public static readonly LOG_BYTE: number = Math.log(0x100)
        protected readonly b: number // base
        protected readonly encodeFactor: number
        protected readonly decodeFactor: number

        constructor(base: number) {
            if (base < RadixCoder.BASE_MIN) {
                throw `Base must be >= ${RadixCoder.BASE_MIN}`
            }
            this.b = base
            let logBase: number = Math.log(base)
            this.encodeFactor = RadixCoder.LOG_BYTE / logBase
            this.decodeFactor = logBase / RadixCoder.LOG_BYTE
        }

        public get base(): number {
            return this.b
        }

        public abstract get mask(): number

        public decode(n: number[]): number[] {
            let zeroCount: number = RadixCoder.leadingZeros(n)
            if (zeroCount == n.length) {
                return RadixCoder.createArray(n.length, 0)
            }
            let capacity: number = zeroCount +
                RadixCoder.ceilMultiply(n.length - zeroCount, this.decodeFactor)
            let dst: number[] = RadixCoder.createArray(capacity, 0)
            let j: number = capacity - 2
            for (let i: number = zeroCount; i < n.length; i++) {
                let carry: number = n[i] & this.mask
                this.checkDigitBase(carry)
                for (let k: number = capacity - 1; k > j; k--) {
                    carry += (dst[k] & 0xff) * this.b
                    dst[k] = carry & 0xff
                    carry >>>= 8
                }
                while (carry > 0) {
                    dst[j--] = carry & 0xff
                    carry >>>= 8
                }
            }
            return RadixCoder.drop(dst, j - zeroCount + 1)
        }

        public encode(bytes: number[]): number[] {
            let zeroCount: number = RadixCoder.leadingZeros(bytes)
            if (zeroCount == bytes.length) {
                return RadixCoder.createArray(bytes.length, 0)
            }
            let capacity: number = zeroCount +
                RadixCoder.ceilMultiply(bytes.length - zeroCount, this.encodeFactor)
            let dst: number[] = RadixCoder.createArray(capacity, 0)
            let j: number = capacity - 2
            for (let i: number = zeroCount; i < bytes.length; i++) {
                let carry: number = bytes[i] & 0xff
                for (let k: number = capacity - 1; k > j; k--) {
                    carry += (dst[k] & this.mask) << 8
                    dst[k] = (carry % this.b) & this.mask
                    carry /= this.b
                }
                while (carry > 0) {
                    dst[j--] = (carry % this.b) & this.mask
                    carry /= this.b
                }
            }
            return RadixCoder.drop(dst, j - zeroCount + 1)
        }

        protected checkBaseMax(max: number): void {
            if (this.b > max) {
                throw `Base must be <= ${max}`
            }
        }

        protected checkDigitBase(digit: number): void {
            if (digit >= this.b) {
                throw `Digit must be < ${this.b}`
            }
        }

        protected static createArray<T>(length: number, value: T): T[] {
            let result: T[] = []
            for (let i: number = 0; i < length; i++) {
                result.push(value)
            }
            return result
        }

        protected static leadingZeros(a: number[]): number {
            let zc: number = 0
            while (zc < a.length && a[zc] == 0) {
                zc++
            }
            return zc
        }

        protected static drop(a: number[], start: number): number[] {
            return start == 0 ?
                a :
                a.slice(start)
        }

        protected static ceilMultiply(n: number, f: number) {
            return Math.ceil(n * f)
        }
    }

    export class U8 extends RadixCoder {
        constructor(base: number) {
            super(base)
            this.checkBaseMax(RadixCoder.BASE_MAX_U8)
        }

        public get mask(): number { return 0xff }
    }

    export class U16 extends RadixCoder {
        constructor(base: number) {
            super(base)
            this.checkBaseMax(RadixCoder.BASE_MAX_U16)
        }

        public get mask(): number { return 0xffff }
    }
}