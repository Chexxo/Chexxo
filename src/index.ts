interface User {
  name: string;
  id: number;
}

/**
 * Represents a User.
 *
 * @param name - The name of the user.
 * @param id   - The id of the user.
 */
class UserAccount {
  /** The name of the user */
  name: string;

  /** The database-id of the user. */
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}
const user: User = new UserAccount("Murphy", 1);

/**
 * Prints the name of a user
 *
 * @function
 */
function helloWorld(): void {
  console.log(user.name);
}

helloWorld();

/**
 * Returns the sum of the two input paramters.
 *
 * @param a - First argument for the sum.
 * @param b - Second argument for the sum.
 * @returns Sum of a and b
 */
function sum(a: number, b: number): number {
  return a + b;
}

export default sum;
