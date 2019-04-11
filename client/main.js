import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {nodes as basicNodes, marks as basicMarks} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import {tableNodes, tableEditing} from 'prosemirror-tables'

import 'prosemirror-tables/style/tables.css'

import "prosemirror-menu/style/menu.css"
import "prosemirror-view/style/prosemirror.css"
import "prosemirror-example-setup/style/style.css"
// import "prosemirror-gapcursor/style/gapcursor.css"

// import './title'

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
    nodes: {
        doc: {content: 'table'},
        paragraph: basicNodes.paragraph,
        heading: {
            attrs: {level: {default: 1}},
            content: "inline*",
            group: "block",
            defining: true,
            parseDOM: [
                {tag: "h1", attrs: {level: 1}},
                {tag: "h2", attrs: {level: 2}},
                {tag: "h3", attrs: {level: 3}}
            ],
            toDOM(node) { return ["h" + node.attrs.level, 0] }
        },
        text: basicNodes.text,
        hard_break: basicNodes.hard_break,
        ...tableNodes({
            tableGroup: '',
            cellContent: 'block+',
            cellAttributes: {
                background: {
                    default: null,
                    getFromDOM(dom) {
                        return dom.style.backgroundColor || null
                    },
                    setDOMAttr(value, attributes) {
                        if (value)
                            attributes.style = (attributes.style || "") + `background-color: ${value};`
                    }
                }
            }
        })
    },
    marks: {
        em: basicMarks.em,
        strong: basicMarks.strong
    }
})

window.onload = function() {
    const textDocument = DOMParser.fromSchema(mySchema).parse(document.querySelector("#content"))

    window.view = new EditorView(document.querySelector("#editor"), {
        state: EditorState.create({
            doc: textDocument,
            plugins: [
                ...exampleSetup({schema: mySchema}),
                tableEditing()
            ]
        })
    })

    console.log(textDocument)
}

console.log(basicNodes)