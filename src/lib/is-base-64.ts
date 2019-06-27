/**
 * Function to check if the base64 string is valid and has a mime type.
 * @param value base64 string with mime type, e.g. `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...litx7AAAAAElFTkSuQmCC`.
 */

export default function(value: string): boolean {
  // first try to match on data:***/***
  const mime: RegExpMatchArray | null = value.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (!mime) {
    return false;
  }

  // mime type is available, so let's now get the real base64 string, by splitting om the first part: `data:***/***;base64,`
  const splitBase64: string[] = value.split(`data:${mime[1]};base64,`);

  if (!splitBase64.length || !splitBase64[1]) {
    return false;
  }

  // The base64 string should be iomn the first index
  const base64: string = splitBase64[1];

  /**
   * See https://stackoverflow.com/a/48770228/1045872 , @author: Raul Santelices
   * Valid base64 strings are a subset of all plain-text strings. Assuming we have a character string,
   * the question is whether it belongs to that subset. One way is what Basit Anwer suggests.
   * Those libraries require installing libicu though. A more portable way is to use the built-in Buffer:
   * `Buffer.from(str, 'base64')`
   * Unfortunately, this decoding function will not complain about non-Base64 characters.
   * It will just ignore non-base64 characters. So, it alone will not help. But you can try
   * encoding it back to base64 and compare the result with the original string:
   */
  if (Buffer.from(base64, 'base64').toString('base64') !== base64) {
    return false;
  }

  return true;
}
