describe('Store', function() {
  it('should be empty', function() {

    db.shows.remove();
    var shows = db.shows.find();

    expect(shows.length).toEqual(0);
  });

  it('should be equals to 1', function() {
    db.shows.remove();
    db.shows.insert({
      name: "Dexter"
    });
    var shows = db.shows.find();

    expect(shows.length).toEqual(1);
  });
});