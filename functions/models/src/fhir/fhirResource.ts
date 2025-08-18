import { type Resource, type Coding, type CodeableConcept } from 'fhir/r4b.js'

export abstract class FHIRResource<T extends Resource> {
  protected data: T

  constructor(data: T) {
    this.data = data
  }

  get id(): string | undefined {
    return this.data.id
  }

  get resourceType(): string {
    return this.data.resourceType
  }

  raw(): T {
    return this.data
  }

  protected containsCoding(
    concept: CodeableConcept | undefined,
    options: Coding[],
  ): boolean {
    if (!concept?.coding) return false
    return options.some((option) =>
      concept.coding?.some(
        (coding) =>
          coding.system === option.system && coding.code === option.code,
      ),
    )
  }
}