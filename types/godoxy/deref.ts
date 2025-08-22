import $RefParser from '@apidevtools/json-schema-ref-parser'

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node deref.ts <input_file>')
  process.exit(1)
}

try {
  const schema = await $RefParser.dereference(inputFile)
  console.log(JSON.stringify(schema))
} catch (error) {
  console.error(error)
}
