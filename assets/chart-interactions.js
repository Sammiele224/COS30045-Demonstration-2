// Give SVG marks the same mouse, keyboard, and selected-state behaviour.
function enableMarkInteraction(selection, statusSelector, describe, onSelect = () => {}) {
  const status = d3.select(statusSelector);
  const initialText = status.text();
  let selectedNode = null;

  function reset() {
    selectedNode = null;
    selection.classed('is-selected', false).attr('aria-pressed', 'false');
    status.text(initialText);
    onSelect(null);
  }

  function show(event, datum) {
    status.text(describe(datum));
  }

  function restore() {
    status.text(selectedNode ? describe(d3.select(selectedNode).datum()) : initialText);
  }

  function select(event, datum) {
    selectedNode = selectedNode === event.currentTarget ? null : event.currentTarget;
    selection
      .classed('is-selected', function () {
        return this === selectedNode;
      })
      .attr('aria-pressed', function () {
        return String(this === selectedNode);
      });
    restore();
    onSelect(selectedNode ? datum : null);
  }

  selection
    .classed('interactive-mark', true)
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', describe)
    .attr('aria-pressed', 'false')
    .on('mouseenter.interaction focus.interaction', show)
    .on('mouseleave.interaction blur.interaction', restore)
    .on('click.interaction', select)
    .on('keydown.interaction', function (event, datum) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select(event, datum);
      }
    });

  return reset;
}
