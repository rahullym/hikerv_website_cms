// Assembles mailto links from reversed data attributes so the address is never in the served HTML.
const rev = (s: string) => s.split("").reverse().join("");

function assemble() {
	document.querySelectorAll<HTMLAnchorElement>("a[data-obf-email]").forEach((a) => {
		const addr = rev(a.dataset.u ?? "") + "@" + rev(a.dataset.d ?? "");
		a.href = "mailto:" + addr;
		if (a.dataset.reveal === "true") a.textContent = addr;
	});
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", assemble);
else assemble();
