let id = 0;

/**
 * A generator function for id's that are unique in this context.
 * @returns The generated id.
 */
export const generateGUID = () => {
	return id++;
}

export type GUID = string;