import React from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

const Label = styled.Text`
  color: ${({theme}) => theme.colors.textPrimary};
`;

export default function Login() {
  return (
    <Container>
      <Label>Login</Label>
    </Container>
  );
}
