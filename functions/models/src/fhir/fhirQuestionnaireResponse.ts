import {
  type QuestionnaireResponse,
  type QuestionnaireResponseItem,
} from "fhir/r4b.js";
import { FHIRResource } from "./fhirResource.js";

export class FHIRQuestionnaireResponse extends FHIRResource<QuestionnaireResponse> {
  get authoredDate(): Date | undefined {
    return this.data.authored ? new Date(this.data.authored) : undefined;
  }

  set authoredDate(date: Date | undefined) {
    this.data.authored = date?.toISOString();
  }

  responseItem(linkIdPath: string[]): QuestionnaireResponseItem | null {
    const items = this.responseItems(linkIdPath);
    switch (items.length) {
      case 0:
        return null;
      case 1:
        return items[0];
      default:
        throw new Error(`Unexpected number of response items found.`);
    }
  }

  responseItems(linkIdPath: string[]): QuestionnaireResponseItem[] {
    const resultValue: QuestionnaireResponseItem[] = [];
    for (const child of this.data.item ?? []) {
      resultValue.push(...this.responseItemsRecursive(linkIdPath, child));
    }
    return resultValue;
  }

  private responseItemsRecursive(
    linkIdPath: string[],
    item: QuestionnaireResponseItem,
  ): QuestionnaireResponseItem[] {
    switch (linkIdPath.length) {
      case 0:
        break;
      case 1:
        if (item.linkId === linkIdPath[0]) {
          return [item];
        }
        break;
      default:
        if (item.linkId === linkIdPath[0]) {
          const childLinkIds = linkIdPath.slice(1);
          const resultValue: QuestionnaireResponseItem[] = [];
          for (const child of item.item ?? []) {
            resultValue.push(
              ...this.responseItemsRecursive(childLinkIds, child),
            );
          }
          return resultValue;
        }
        break;
    }
    return [];
  }
}
