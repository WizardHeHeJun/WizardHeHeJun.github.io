// 把 markdown 里的 ```mermaid 代码块包成 <pre class="mermaid">，让客户端 mermaid.js 渲染
//
// 流程：
//   build 时（这里）：```mermaid ... ``` → <figure class="mermaid-figure"><pre class="mermaid">...</pre></figure>
//   运行时（BlogPost.astro 末尾 inline script）：检测页面含 .mermaid → dynamic import mermaid → run()
//
// 设计选择：
//   - 不在 build 阶段渲染 SVG（避免 puppeteer / playwright 几百 MB 依赖）
//   - 仅含 mermaid 块的博文页才 lazy load mermaid.js（其他页面零负担）
//   - 容器 figure 套玻璃风样式，统一视觉
import { visit } from 'unist-util-visit';

export default function remarkMermaid() {
	return (tree) => {
		visit(tree, 'code', (node, _index, parent) => {
			if (node.lang !== 'mermaid') return;
			if (!parent) return;
			const idx = parent.children.indexOf(node);
			if (idx === -1) return;
			parent.children[idx] = {
				type: 'html',
				value:
					`<figure class="mermaid-figure">` +
					`<pre class="mermaid">${escapeHtml(node.value)}</pre>` +
					`</figure>`,
			};
		});
	};
}

function escapeHtml(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
