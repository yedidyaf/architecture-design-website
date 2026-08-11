import {defineField, defineType} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'אודות ולוגו',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'שם', type: 'string'}),
    defineField({name: 'logo', title: 'לוגו', type: 'image'}),
    defineField({name: 'bio', title: 'טקסט אודות', type: 'text'}),
  ],
})
