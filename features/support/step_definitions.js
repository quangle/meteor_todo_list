module.exports = function() {

  this.Given(/^I am on the home page$/, function () {
    browser.url("http://localhost:3100");
  });

  this.Then(/^I should see "([^"]*)"$/, function (text) {
    expect(browser.getText("h1")).toEqual(text);
  });

}
