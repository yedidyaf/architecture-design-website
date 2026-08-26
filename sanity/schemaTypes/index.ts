import { type SchemaTypeDefinition } from 'sanity'
import {project} from './project'
import {about} from './about'
import {testimonial} from './testimonial'
import {contentImage} from './contentImage'
import {beforeAfter} from './beforeAfter'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, about, testimonial, contentImage, beforeAfter],
}
