describe('suite', () => {
    it('should pass', () => {
        cy.wrap(true).should('be.eq', true);
    });
});
