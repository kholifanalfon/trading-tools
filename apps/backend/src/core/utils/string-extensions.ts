// Implement String.prototype.removeNewline globally
String.prototype.removeNewline = function (this: string) {
  return this.replace(/[\r\n]+/g, "");
};
