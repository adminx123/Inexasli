# XAI Collection Settings for Business Chat

- **Collection Name**: A simple name you give to this group of documents, like a folder name, so you can find it easily. Recommended: "INEXASLI Knowledge Base"
- **Embedding Model**: An AI tool that converts your text into special codes (called vectors) that help the AI understand and search the meaning of words. Recommended: grok-embedding-small
- **Chunking Method**: How the AI breaks long documents into smaller sections: "Token based" means by words or word parts, "Char based" means by individual letters. Recommended: Token based chunking
- **Max Chunk Size**: The maximum number of words (or letters) in each small section; keeps things manageable for the AI. Recommended: 512
- **Chunk Overlap**: How many words/letters repeat at the end of one section and start of the next, so the AI doesn't lose context between sections. Recommended: 50
- **Encoding Name**: The rule the AI uses to count and understand words, like a dictionary for the computer. Recommended: o200k_base
- **Inject Name into Chunks**: Should the AI add the document's title to the beginning of each section? This helps with searching. Recommended: Enabled (Yes)