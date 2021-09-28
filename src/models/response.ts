export class Response<T> {
  data: T;
  total: number;
  constructor(data: T) {
    this.data = data;
    if (Array.isArray(data)) {
      this.total = data.length;
    } else {
      this.total = 0;
    }
  }
}
