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
    const BASE_MIN: number = 2
    const BASE_MAX_U8: number = 0x100
    const BASE_MAX_U16: number = 0x10000
    const LOG_BYTE: number = Math.log(0x100)

    function createArray<T>(length: number, value: T): T[] {
        let result: T[] = []
        for (let i: number = 0; i < length; i++) {
            result.push(value)
        }
        return result
    }

    function leadingZeros(a: number[]): number {
        let zc: number = 0
        while (zc < a.length && a[zc] == 0) {
            zc++
        }
        return zc
    }

    function drop(a: number[], start: number): number[] {
        return start == 0 ?
            a :
            a.slice(start)
    }

    function ceilMultiply(n: number, f: number) {
        return Math.ceil(n * f)
    }

    export class U8 {
        protected readonly b: number // base
        protected readonly encodeFactor: number
        protected readonly decodeFactor: number

        constructor(base: number) {
            if (base < BASE_MIN) {
                throw `Base must be >= ${BASE_MIN}`
            }
            this.b = base
            let logBase: number = Math.log(base)
            this.encodeFactor = LOG_BYTE / logBase
            this.decodeFactor = logBase / LOG_BYTE
            this.checkBaseMax(BASE_MAX_U8)
        }

        public get base(): number {
            return this.b
        }

        public get mask(): number { return 0xff }

        public decode(n: number[]): number[] {
            let zeroCount: number = leadingZeros(n)
            if (zeroCount == n.length) {
                return createArray(n.length, 0)
            }
            let capacity: number = zeroCount +
                ceilMultiply(n.length - zeroCount, this.decodeFactor)
            let dst: number[] = createArray(capacity, 0)
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
            return drop(dst, j - zeroCount + 1)
        }

        public encode(bytes: number[]): number[] {
            let zeroCount: number = leadingZeros(bytes)
            if (zeroCount == bytes.length) {
                return createArray(bytes.length, 0)
            }
            let capacity: number = zeroCount +
                ceilMultiply(bytes.length - zeroCount, this.encodeFactor)
            let dst: number[] = createArray(capacity, 0)
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
            return drop(dst, j - zeroCount + 1)
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
    }

    export class U16 {
        protected readonly b: number // base
        protected readonly encodeFactor: number
        protected readonly decodeFactor: number

        constructor(base: number) {
            if (base < BASE_MIN) {
                throw `Base must be >= ${BASE_MIN}`
            }
            this.b = base
            let logBase: number = Math.log(base)
            this.encodeFactor = LOG_BYTE / logBase
            this.decodeFactor = logBase / LOG_BYTE
            this.checkBaseMax(BASE_MAX_U16)
        }

        public get base(): number {
            return this.b
        }

        public get mask(): number { return 0xffff }

        public decode(n: number[]): number[] {
            let zeroCount: number = leadingZeros(n)
            if (zeroCount == n.length) {
                return createArray(n.length, 0)
            }
            let capacity: number = zeroCount +
                ceilMultiply(n.length - zeroCount, this.decodeFactor)
            let dst: number[] = createArray(capacity, 0)
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
            return drop(dst, j - zeroCount + 1)
        }

        public encode(bytes: number[]): number[] {
            let zeroCount: number = leadingZeros(bytes)
            if (zeroCount == bytes.length) {
                return createArray(bytes.length, 0)
            }
            let capacity: number = zeroCount +
                ceilMultiply(bytes.length - zeroCount, this.encodeFactor)
            let dst: number[] = createArray(capacity, 0)
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
            return drop(dst, j - zeroCount + 1)
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
    }
    /*
    export class U16 extends RadixCoder {
        constructor(base: number) {
            super(base)
            this.checkBaseMax(RadixCoder.BASE_MAX_U16)
        }

        public get mask(): number { return 0xffff }
    }
    */
}