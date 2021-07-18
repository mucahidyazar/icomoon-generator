var mockFunction = jest.fn();

var options = {
  selectionPath: 'icons/selection.json',
  outputDir: 'icons',
  svgDir: 'svg',
  forceOverride: true,
  visible: true,
  whenFinished(result) {
    // you can get the absolute path of output directory via result.outputDir
  },
};

it('Function called', () => {
  mockFunction();

  expect(mockFunction).toHaveBeenCalledTimes(1);
});

it('Function called by right options', () => {
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(options);
});

it('To be called with selectionPath', () => {
  // expect(options).objectContaining({ selectionPath: options.selectionPath });
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(
    expect.objectContaining({ selectionPath: options.selectionPath })
  );
});

it('To be called with outputDir', () => {
  // expect(options).objectContaining({ selectionPath: options.selectionPath });
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(
    expect.objectContaining({ outputDir: options.outputDir })
  );
});

it('To be called with svgDir', () => {
  // expect(options).objectContaining({ selectionPath: options.selectionPath });
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(
    expect.objectContaining({ svgDir: options.svgDir })
  );
});

it('To be called with forceOverride', () => {
  // expect(options).objectContaining({ selectionPath: options.selectionPath });
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(
    expect.objectContaining({ forceOverride: options.forceOverride })
  );
});

it('To be called with visible', () => {
  // expect(options).objectContaining({ selectionPath: options.selectionPath });
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(
    expect.objectContaining({ visible: options.visible })
  );
});

it('To be called with whenFinished', () => {
  // expect(options).objectContaining({ selectionPath: options.selectionPath });
  mockFunction(options);

  expect(mockFunction).toBeCalledWith(
    expect.objectContaining({ whenFinished: options.whenFinished })
  );
});
