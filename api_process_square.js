// api_process_square.js

// Handler: POST /getSquareArea
export function process_post_square_area(req, res) {
  const { side, unit } = req.body;
  if (isNaN(side)) return res.status(400).json({ error: 'Invalid side' });

  const area = side * side;
  res.json({
    side,
    area,
    unit: unit ? unit + '²' : undefined,
  });
}

// Handler: GET /getSquareArea
export function process_get_square_area(req, res) {
  const side = parseFloat(req.query.side || req.body.side);
  const unit = (req.query.unit || req.body.unit || '').trim();
  if (isNaN(side)) return res.status(400).json({ error: 'Invalid side' });

  res.json({
    side,
    area: side * side,
    unit: unit + '²',
  });
}

// Handler: GET /getSquarePerimeter
export function process_get_square_perimeter(req, res) {
  const side = parseFloat(req.query.side || req.body.side);
  const unit = (req.query.unit || req.body.unit || '').trim();
  if (isNaN(side)) return res.status(400).json({ error: 'Invalid side' });

  res.json({
    side,
    perimeter: side * 4,
    unit,
  });
}
