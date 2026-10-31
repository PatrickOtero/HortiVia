import React from 'react';
import { FilterChip, InputField } from '../../../../../components';
import type { ProductCategory } from '../../../../products/types/product';
import { ADMIN_PRODUCT_CATEGORY_OPTIONS } from '../../../utils/adminContent';
import type {
  ProductFormErrors,
  ProductFormValues,
} from '../../../utils/adminProductForm';
import * as S from '../styles';

type ProductFormFieldsProps = {
  section: 'primary' | 'details';
  values: ProductFormValues;
  errors: ProductFormErrors;
  onChange: (
    field: Exclude<keyof ProductFormValues, 'category'>,
    value: string,
  ) => void;
  onCategoryChange?: (category: ProductCategory) => void;
};

export function ProductFormFields({
  section,
  values,
  errors,
  onChange,
  onCategoryChange,
}: ProductFormFieldsProps) {
  if (section === 'details') {
    return (
      <>
        <InputField
          label="Benefícios"
          value={values.benefits}
          onChangeText={value => onChange('benefits', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <InputField
          label="Como escolher"
          value={values.howToChoose}
          onChangeText={value => onChange('howToChoose', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <InputField
          label="Como conservar"
          value={values.howToStore}
          onChangeText={value => onChange('howToStore', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <InputField
          label="Dicas de uso"
          value={values.usageTips}
          onChangeText={value => onChange('usageTips', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <InputField
          label="Nutrientes"
          value={values.nutrients}
          onChangeText={value => onChange('nutrients', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </>
    );
  }

  return (
    <>
      <InputField
        label="Nome"
        value={values.name}
        onChangeText={value => onChange('name', value)}
        helperText={errors.name}
      />
      <S.CategoryGroup>
        <S.CategoryLabel>Categoria</S.CategoryLabel>
        <S.ChipRow>
          {ADMIN_PRODUCT_CATEGORY_OPTIONS.map(option => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={values.category === option.value}
              onPress={() => onCategoryChange?.(option.value)}
            />
          ))}
        </S.ChipRow>
        {errors.category ? <S.ErrorText>{errors.category}</S.ErrorText> : null}
      </S.CategoryGroup>
      <InputField
        label="Descrição curta"
        value={values.shortDescription}
        onChangeText={value => onChange('shortDescription', value)}
        helperText={errors.shortDescription}
      />
      <InputField
        label="Descrição"
        value={values.description}
        onChangeText={value => onChange('description', value)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </>
  );
}
