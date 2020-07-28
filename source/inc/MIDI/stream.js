
/* Wrapper for accessing buffer through sequential reads */



module.exports = class Stream {
	array = null;
	position = 0;


	constructor (buffer) {
		this.array = new Uint8Array(buffer);
	}


	eof () {
		return this.position >= this.array.length;
	}


	read (length) {
		const result = this.array.slice(this.position, length);
		this.position += length;

		return result;
	}


	// read a big-endian 32-bit integer
	readInt32 () {
		const result = (
			(this.array[this.position] << 24) +
			(this.array[this.position + 1] << 16) +
			(this.array[this.position + 2] << 8) +
			this.array[this.position + 3]);
		this.position += 4;

		return result;
	}


	// read a big-endian 16-bit integer
	readInt16 () {
		const result = (
			(this.array[this.position] << 8) +
			this.array[this.position + 1]);
		this.position += 2;

		return result;
	}


	// read an 8-bit integer
	readInt8 (signed) {
		let result = this.array[this.position];
		if (signed && result > 127)
			result -= 256;
		this.position += 1;

		return result;
	}


	/* read a MIDI-style variable-length integer
		(big-endian value in groups of 7 bits,
		with top bit set to signify that another byte follows)
	*/
	readVarInt () {
		let result = 0;
		while (true) {
			const b = this.readInt8();
			if (b & 0x80) {
				result += (b & 0x7f);
				result <<= 7;
			}
			else {
				// b is the last byte
				return result + b;
			}
		}
	}
};
