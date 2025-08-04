/// <reference types="fhir" />

type Resource = fhir4.Resource;
type Coding = fhir4.Coding;
type CodeableConcept = fhir4.CodeableConcept;

export abstract class FHIRResource<T extends Resource> {
  protected data: T;

  constructor(data: T) {
    this.data = data;
  }

  get id(): string | undefined {
    return this.data.id;
  }

  get resourceType(): string {
    return this.data.resourceType;
  }

  raw(): T {
    return this.data;
  }

  protected containsCoding(
    concept: CodeableConcept | undefined,
    options: Coding[],
  ): boolean {
    if (!concept?.coding) return false;
    return options.some((option) =>
      concept.coding?.some(
        (coding: Coding) =>
          coding.system === option.system && coding.code === option.code,
      ),
    );
  }
}
