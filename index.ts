interface DifferenceCreate {
	type: "CREATE";
	path: Path;
	value: any;
}

interface DifferenceRemove {
	type: "REMOVE";
	path: Path;
	oldValue: any;
}

interface DifferenceChange {
	type: "CHANGE";
	path: Path;
	value: any;
	oldValue: any;
}

type Path = (string | number)[];
type Difference = DifferenceCreate | DifferenceRemove | DifferenceChange;
export default function patch(
	obj: Record<string, any> | any[],
	diffs: Difference[]
): Record<string, any> | any[] {
	const removeSymbol = Symbol("micropatch-delete");

	for (const diff of diffs) {
		if (!diff.path || !diff.path.length) continue;

		const lastPathElement = diff.path[diff.path.length - 1];
		const secondLastPathElement = diff.path[diff.path.length - 2];

		const parentObj = new Array(Math.max(diff.path.length - 2, 0))
			.fill(null)
			.reduce((pv, _, i) => pv[diff.path[i]], obj);
		const currObj = secondLastPathElement
			? parentObj[secondLastPathElement]
			: obj;

		if (currObj[lastPathElement] === undefined && diff.type != "CREATE")
			throw new Error(`Path ${diff.path} doesn't exist`);

		switch (diff.type) {
			case "CREATE":
			case "CHANGE":
				currObj[lastPathElement] = diff.value;
				break;
			case "REMOVE":
				if (Array.isArray(currObj)) {
					currObj[lastPathElement] = removeSymbol;
					if (secondLastPathElement !== undefined) {
						parentObj[secondLastPathElement] = currObj.filter(
							(e: any) => e !== removeSymbol
						);
					} else {
						obj = obj.filter((e: any) => e !== removeSymbol);
					}
				} else {
					delete currObj[lastPathElement];
				}
				break;
		}
	}

	return obj;
}
