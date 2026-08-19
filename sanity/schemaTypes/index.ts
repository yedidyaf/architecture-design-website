import { type SchemaTypeDefinition } from 'sanity'
import {project} from './project'
import {about} from './about'
import {testimonial} from './testimonial'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, about, testimonial],
}
