#!/usr/bin/env python
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup                      #импорт необходимых библиотек
import logging
import copy
from jinja2 import Environment, FileSystemLoader


logging.basicConfig(level=logging.INFO, format='%(lineno)d %(asctime)s %(message)s')
soup = BeautifulSoup(open("form1.xml"),"lxml")     #дерево разбора, получаемое с использованием синт. анализатора LXML

new_soup = copy.deepcopy(soup)                     #его копия

f = open('view2.html', 'w')                 #открытие файла для записи

tag=soup.form            #начальный тег <form>
tag=tag.next			 #переход дальше
new_tag=new_soup.form
js_form=new_tag['name']  #запись в спец переменную имени формы
new_tag=new_tag.next

new_soup.form.unwrap()   #удаляем  тег <form>, тк в html он не нужен

if tag.name is None:     #если оказался не тег, то переход еще дальше
    tag=tag.next
    new_tag=new_tag.next

def func_panel(tag):        #функция обработки панели (далее аналогично по названию функции)
    count = 0
    add = False
    tag.name="div"
    if tag["height"] is not None: del tag['height']
    return add, count

def func_lookup(tag):
    count = 0
    add = False
    tag.name = "ui-select"
    if tag["label"] is not None:
        tag['title'] = tag['label']
        del tag['label']
    if tag['data'] is not None:
        data[tag['id']]= tag['data']       #добавление необходимых для шаблона данных в словарь
        del tag['data']
    tag['ng-model theme'] = 'select2'
    tag['ng-disabled'] = 'false'
    tag['style'] = 'width:100%'
    new_tag = new_soup.new_tag("ui-select-match")
    tag.append(new_tag)
    add = True
    count=count+1
    new_tag.string = "{{$select.selected."+tag['list_value']+"}}"
    new_tag = new_soup.new_tag("ui-select-choices")
    tag.append(new_tag)
    count = count + 1
    new_tag['repeat'] = 'y in data_levels'
    tag = new_tag
    new_tag = new_soup.new_tag("div")
    tag.append(new_tag)
    count = count + 1
    new_tag['ng-bind-html'] = "trustAsHtml(y.NAME)"   #ошибка
    return add, count

def func_label(tag):
    count=0
    add = False
    tag.name = "p"
    if tag["caption"] is not None:
        tag.string = tag['caption']
        del tag['caption']
    return add, count

def func_grid(tag):
    count=0
    add = False
    fields = []
    tag.name= "div"
    str='ui-grid-cellNav ui-grid-resize-columns ui-grid-move-columns ui-grid-pinning ui-grid-selection ui-grid-exporter ui-grid-auto-resize '
    tag[str+'ui-grid'] = tag['id']+'Options'
    tag['data'], rub = tag['data'].split('(')               #модификация данных для шаблона в удобную форму
    if tag['id'] == 'curr_grd':
        data['get_currs']=rub.replace(rub[-1],'')
    if tag.children is not None:
        for child in tag.children:
            if child.name=='column':
                    fields.append(child.attrs)
        data[tag['id']]= tag['data'], fields       #добавление необходимых для шаблона данных в словарь
        del tag['data']
    if tag['id']=='curr_grd':                   #ng-click??
        tag['ng-click'] = 'curr_grdClick()'
        tag['style'] = 'height: 450px;'
    return add, count


def func_column(tag):
    count=0
    add = False
    return add, count

def func_tabs(tag):
    count=0
    add = False
    tag.name = "uib-tabset"
    tag['justified'] = 'true'
    return add, count

def func_tab(tag):
    count=0
    add = False
    tag.name = "uib-tab"
    if tag["label"] is not None:
        tag['heading'] = tag['label']
        del tag['label']
    return add, count

def func_button(tag):
    count=0
    add = False
    tag['type'] = 'button'
    tag['class'] = "btn btn-primary"
    #if tag["caption"] is not None:  #ошибка
     #   tag.string = tag['caption']
      #  del tag['caption']
    return add, count
    
def func_btn_group(tag):
    count=0
    add=False
    tag.name = "div"
    tag['class'] = "btn-group"
    return add, count

def add_id(tag):                    #функция, меняющая атрибут тега "name" на "id"
    tag['id'] = tag['name']
    del tag['name']

dict_func = {'panel': func_panel,       #выбор функции обработки тега по его названию
             'lookup': func_lookup,
             'label': func_label,
             'grid': func_grid,
             'column': func_column,
             'tabs': func_tabs,
             'tab': func_tab,
             'button': func_button,
             'btn_group': func_btn_group
            }

list=[]                                 #лист ссылок на исходный тег и соответствующий ему обработанный тег

data = {'js_name': js_form}

while tag is not None:                  #цикл прохода дерева синт. разбора
    if tag.name is not None:
        try:
                print(tag.name, new_tag.name)
                add_id(new_tag)
                add, count = dict_func[new_tag.name](new_tag)      #вызов функций для обработки тега
                print(count)
                if add is True:                                 #значит добавились новые теги
                    while count is not 0:                       #цикл для случаев, когда при обработке тега добавлялись новые.
                        print(count, new_tag.name)               #чтобы восстановить соответствие между исходным тегом и обработанным
                        if new_tag.name is not None:count=count-1
                        new_tag = new_tag.next
        except KeyError:
                logging.error('Error with tag named %s', new_tag.name)      #сообщение об ошибке, связанной с текущим тегом
    list.append({'src': tag, 'dest': new_tag})                       #добавление ссылок в лист
    tag = tag.next                                                     #переход на следующий тег
    new_tag = new_tag.next

print(data)

del_list=new_soup.find_all('column')                                #удаление тегов <column>
for tag in del_list:
    tag.decompose()


f.write(str(new_soup.prettify().replace('<?xml version="1.0" encoding="utf-8"?>','')))  #запись обработанного дерева в файл


env = Environment(loader=FileSystemLoader('.'))         #загрузка шаблона
template = env.get_template('js_template.js')

with open("translator.js", "w") as f:                               #создание выходного js файла
   f.write(template.render(data))