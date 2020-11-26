/**
 * Class which is responsible for creating uuid's
 * with the required amount of entropy.
 */
export abstract class UUIDFactory {
  /**
   * Create a uuid version 4.
   * @returns The string representation of a uuid
   * version 4.
   */
  public static uuidv4(): string {
    const randomValues = new Uint8Array(36);
    window.crypto.getRandomValues(randomValues);

    function getUUIDChar(char: string, position: number) {
      if (char === "y") {
        const array = ["8", "9", "a", "b"];
        return array[Math.floor(Math.random() * array.length)];
      }
      return (randomValues[position] % 16).toString(16);
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, getUUIDChar);
  }
}
