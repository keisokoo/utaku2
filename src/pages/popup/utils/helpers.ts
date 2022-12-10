export function isEllipsisActive(e: HTMLElement) {
  if (e.children.length > 0) {
    let childArray = [] as boolean[]
    for (let child of e.children) {
      childArray.push((child as HTMLElement).offsetWidth < child.scrollWidth)
    }
    return childArray.find((bool) => bool) ? true : false
  } else if (e.offsetWidth && e.offsetWidth) {
    return e.offsetWidth < e.scrollWidth
  } else {
    return false
  }
}
