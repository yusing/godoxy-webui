import $RefParser from '@apidevtools/json-schema-ref-parser'
import fs from 'bun'

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node deref.ts <input_file>')
  process.exit(1)
}

const outputFile = inputFile.replace('.json', '.deref.json')

try {
  const schema = await $RefParser.dereference(inputFile)
  fs.write(outputFile, JSON.stringify(schema, null, 0))
} catch (error) {
  console.error(error)
}
