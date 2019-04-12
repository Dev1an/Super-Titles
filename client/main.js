import {EditorState, TextSelection} from 'prosemirror-state'
import {EditorView} from 'prosemirror-view'
import {Schema, DOMParser} from 'prosemirror-model'
import {nodes as basicNodes, marks as basicMarks} from 'prosemirror-schema-basic'
import {exampleSetup} from 'prosemirror-example-setup'
import {tableNodes, tableEditing} from 'prosemirror-tables'
import {keymap} from 'prosemirror-keymap'
import {splitBlock} from "prosemirror-commands"


import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-example-setup/style/style.css'
import 'prosemirror-gapcursor/style/gapcursor.css'

import './menubar.css'
import './table.css'

const tableNodesSpec = tableNodes({
	tableGroup: '',
	cellContent: 'block+'
})
tableNodesSpec.table.content = '(table_row | supertitleRow)+'

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
		supertitleRow: {
			content: 'supertitle*',
			tableRole: "row",
			parseDOM: [{tag: 'tr.supertitle'}],
			toDOM() { return ['tr', {class: 'supertitle'}, 0] }
		},
		supertitle: {
			content: 'paragraph+',
			attrs: tableNodesSpec.table_cell.attrs,
			tableRole: "cell",
			isolating: true,
			parseDOM: [{
				tag: 'td.supertitle',
				getAttrs: tableNodesSpec.table_cell.getAttrs
			}],
			toDOM(node) {
				const dom = tableNodesSpec.table_cell.toDOM(node)
				dom[1].class = 'supertitle'
				return dom
			}
		},
		...tableNodesSpec,
	},
	marks: {
		em: basicMarks.em,
		strong: basicMarks.strong,
	}
})

window.onload = function() {
	const textDocument = DOMParser.fromSchema(mySchema).parse(document.querySelector("#content"))
	
	window.view = new EditorView(document.querySelector("#editor"), {
		state: EditorState.create({
			doc: textDocument,
			plugins: [
				...exampleSetup({schema: mySchema, floatingMenu: false}),
				tableEditing(),
			]
		})
	})
	
	console.log(textDocument)
}